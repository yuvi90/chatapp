import { useAuth } from "../context/AuthContext";

const ChatPage = () => {
  const { logout } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-4">
      <h1>Chat Page</h1>
      <p>This is the chat page.</p>
      <button
        className="btn btn-primary"
        onClick={() => logout()}
      >
        Logout
      </button>
    </div>
  );
};

export default ChatPage;
