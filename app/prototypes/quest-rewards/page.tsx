import BrandLogo from '../../brand-logo';
import QuestRewardsView from './quest-rewards-view';
export default function QuestRewardsPrototype() {
  return <main className="qr-shell"><header className="qr-site-header"><a href="/" aria-label="Ironpath home"><BrandLogo subtitle="YOUR IRONMAN JOURNEY"/></a></header><nav className="qr-preview-nav" aria-label="Prototype navigation"><a href="/">Dashboard</a><span>Progression</span><strong>Quest rewards</strong><a href="/prototypes">Design lab</a></nav><QuestRewardsView/></main>;
}
