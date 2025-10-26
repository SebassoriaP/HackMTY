import { Routes, Route } from "react-router-dom";
import Test from "../pages/Test";
import Choose from "../pages/Choose";
import Search from "../pages/Search";
import Bottle from "../pages/Bottle";
import BottleDetail from "../pages/BottleDetail"; 

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

        <Route path="/airline/:id" element={<Bottle />} />

        <Route path="/bottle/:airlineId/:bottleId" element={<BottleDetail />} />

    </Routes>
    );
};

export default AppRouter;