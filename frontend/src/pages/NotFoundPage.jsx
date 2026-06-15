import { Link } from 'react-router-dom';
import { Button, EmptyState } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <EmptyState
        emoji="🧭"
        title="Lost the trail"
        action={
          <Link to="/">
            <Button variant="primary">Back to your trips</Button>
          </Link>
        }
      >
        We couldn’t find that page.
      </EmptyState>
    </div>
  );
}
