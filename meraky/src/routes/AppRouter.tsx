import { Routes, Route } from "react-router-dom";
import Test from "../pages/Test";
import Choose from "../pages/Choose";


const AppRouter = () => {
  return (
    <Routes>
        <Route path="/" element={<Choose/>} />

        <Route path="/A" element={ 
            <Test />
        } />

        <Route path="/B" element={ 
            <Test />
        } />


    </Routes>
    );
};

export default AppRouter;