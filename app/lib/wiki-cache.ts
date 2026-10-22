export type CacheRecord = { data?:unknown; error?:string; status?:number; fetchedAt:number; expiresAt:number; retryAt?:number };
export interface WikiStore { read(key:string):Promise<CacheRecord|null>; write(key:string,value:CacheRecord):Promise<void>; claim(key:string,until:number,now:number):Promise<boolean>; release(key:string):Promise<void> }
export class CachedWiki {
  private pending=new Map<string,Promise<CacheRecord>>();
  private store:WikiStore;
  private clock:()=>number;
  constructor(store:WikiStore,clock=Date.now){this.store=store;this.clock=clock;}
  async get(key:string,ttl:number,load:()=>Promise<unknown>):Promise<CacheRecord> {
    const previous=await this.store.read(key),now=this.clock();
    if(previous&&previous.expiresAt>now)return previous;
    if(previous?.data&&previous.retryAt&&previous.retryAt>now)return previous;
    const current=this.pending.get(key);if(current)return current;
    const work=this.refresh(key,ttl,load,previous,now).finally(()=>this.pending.delete(key));this.pending.set(key,work);return work;
  }
  private async refresh(key:string,ttl:number,load:()=>Promise<unknown>,previous:CacheRecord|null,now:number):Promise<CacheRecord> {
    if(!await this.store.claim(key,now+45_000,now)){
      if(previous?.data)return previous;
      // Another server is filling this key. Do not duplicate the Wiki request.
      return {error:'This guide is being cached. Please try again in a few seconds.',status:503,fetchedAt:now,expiresAt:now};
    }
    try {
      const data=await load();const record={data,fetchedAt:now,expiresAt:now+ttl};await this.store.write(key,record);return record;
    } catch(error) {
      const status=(error as {status?:number}).status||502;
      if(previous?.data){const stale={...previous,retryAt:now+3_600_000};await this.store.write(key,stale);return stale;}
      const record={error:error instanceof Error?error.message:'The Wiki is temporarily unavailable.',status,fetchedAt:now,expiresAt:now+(status===404?86_400_000:60_000)};await this.store.write(key,record);return record;
    } finally {await this.store.release(key);}
  }
}
