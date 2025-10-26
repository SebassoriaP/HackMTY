import { useNavigate } from "react-router-dom";
import SearchAirline from "../components/SearchAirline";
import "./css/Search.css";

function Search() {
  const navigate = useNavigate();


  const handleSelectAirline = (airline: any) => {
    console.log("Seleccionaste:", airline);

    navigate(`/airline/${airline.id}`, { state: airline });
  };

  return (
    <div className="search-page">
      <SearchAirline onSelect={handleSelectAirline} />
    </div>
  );
}

export default Search;
