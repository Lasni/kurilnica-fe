import toast from "react-hot-toast";

export interface ToastComponentProps {
  invitingUserUsername: string;
  conversationId: string;
  userId: string;
  clearPopupDataCallback: () => void;
}

const ToastComponent = ({
  invitingUserUsername,
  conversationId,
  userId,
  clearPopupDataCallback,
}: ToastComponentProps) => {
  return (
    <div>
      {toast.loading(
        (t) => (
          <span>
            User {invitingUserUsername} has invited you to conversation
            <div>
              <button
              // onClick={() =>
              //   onHandleConversationInvitation(true, t.id, conversationId)
              // }
              >
                Accept
              </button>
              <button onClick={clearPopupDataCallback}>Decline</button>
            </div>
          </span>
        ),
        {
          // icon: <Icon />,
        }
      )}
    </div>
  );
};

export default ToastComponent;
