// import toast from "react-hot-toast";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export interface ToastComponentProps {
  invitingUserUsername?: string;
  conversationId?: string;
  userId?: string;
  clearPopupDataCallback: () => void;
  handleConversationInvitationCallback: (
    accept: boolean,
    conversationId?: string
  ) => Promise<void>;
}

const ToastComponent = ({
  invitingUserUsername,
  conversationId,
  userId,
  clearPopupDataCallback,
  handleConversationInvitationCallback,
}: ToastComponentProps) => {
  return (
    <div>
      <span>
        User {invitingUserUsername} has invited you to conversation
        <div>
          <button
            onClick={() =>
              handleConversationInvitationCallback(true, conversationId)
            }
          >
            Accept
          </button>
          <br />
          <button onClick={clearPopupDataCallback}>Decline</button>
        </div>
      </span>
      {/* {toast.loading(
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
        } */}
    </div>
  );
};

export default ToastComponent;
