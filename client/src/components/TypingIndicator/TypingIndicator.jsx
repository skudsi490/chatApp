import Lottie from 'react-lottie';
import typingAnimation from '../../animations/typing.json';
import "./TypingIndicator.css";

const TypingIndicator = ({ isTyping }) => {
    console.log("Typing Indicator Rendering: ", isTyping); 
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: typingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div className="typing-indicator-wrapper"> 
      {isTyping && (
        <Lottie options={defaultOptions} height={40} width={84} />
      )}
    </div>
  );
};

export default TypingIndicator;
