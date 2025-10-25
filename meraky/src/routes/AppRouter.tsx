import { Routes, Route } from "react-router-dom";
import Test from "../pages/Test";
import Choose from "../pages/Choose";
import FlightSearch from "../pages/FlightSearch";


const AppRouter = () => {
  return (
    <Routes>
        <Route path="/" element={<Choose/>} />

        <Route path="/pick" element={ 
            <FlightSearch />
        } />

        <Route path="/pack" element={ 
            <Test />
        } />


    </Routes>
    );
};

export default AppRouter;