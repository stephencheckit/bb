import HomePage from './home-page';
import beaches from '@/data/beaches.json';

export default function Home() {
  return <HomePage beaches={beaches} />;
}
