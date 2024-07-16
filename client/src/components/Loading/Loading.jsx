import { TailSpin } from 'react-loader-spinner'; 
import './Loading.css'; 

const Loading = () => {
  return (
    <div className="loading-container">
      <TailSpin
        color="#00BFFF"  
        height={80}  
        width={80}  
      />
    </div>
  );
};

export default Loading;
