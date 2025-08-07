import { Navigate } from 'react-router-dom';
import UserInputForm from '../components/UserInputForm';

export default function BaseInputPage({ user }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h2>Create Your Base</h2>
      <UserInputForm user={user} />
    </div>
  );
}
