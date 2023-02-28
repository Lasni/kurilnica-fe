// import toast from "react-hot-toast";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const notify = () => toast("Wow so easy!");

  return (
    <div>
      <button onClick={notify}>Notify!</button>
      <ToastContainer />
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
