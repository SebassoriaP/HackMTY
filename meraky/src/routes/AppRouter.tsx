import { Routes, Route } from "react-router-dom";
import Test from "../pages/Test";
import Choose from "../pages/Choose";
import Search from "../pages/Search";


const AppRouter = () => {
  return (
    <Routes>
        <Route path="/" element={<Choose/>} />

        <Route path="/bottles" element={ 
            <Search/>
        } />

        <Route path="/pick" element={ 
            <Test />
        } />


    </Routes>
    );
};

export default AppRouter;