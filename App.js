import logo from './logo.svg';
import './App.css';
import {useState} from "react";

const geoapi = {
    base: "https://wft-geo-db.p.rapidapi.com/v1/geo",
    headers: {
        "X-RapidAPI-Key": "00986c9699msh2588d4879ef4029p1f8872jsnde1574429ea8",
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
    }
}

const api = {
  key: "9112482981d3d07b3b0052098fbcde0f",
  base: "https://api.openweathermap.org/data/2.5/"
}
function App() {
    const [query, setQuery] = useState('');
    const [weather, setWeather] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const weatherCodeMap = {
        200: "thunderstorm with light rain",
        201: "thunderstorm with rain",
        202: "thunderstorm with heavy rain",
        210: "light thunderstorm",
        211: "thunderstorm",
        212: "heavy thunderstorm",
        221: "ragged thunderstorm",
        230: "thunderstorm with light drizzle",
        231: "thunderstorm with drizzle",
        232: "thunderstorm with heavy drizzle",
        300: "light intensity drizzle",
        301: "drizzle",
        302: "heavy intensity drizzle",
        310: "light intensity drizzle rain",
        311: "drizzle rain",
        312: "heavy intensity drizzle rain",
        313: "shower rain and drizzle",
        314: "heavy shower rain and drizzle",
        321: "shower drizzle",
        500: "light rain",
        501: "moderate rain",
        502: "heavy intensity rain",
        503: "very heavy rain",
        504: "extreme rain",
        511: "freezing rain",
        520: "light intensity shower rain",
        521: "shower rain",
        522: "heavy intensity shower rain",
        531: "ragged shower rain",
        600: "light snow",
        601: "snow",
        602: "heavy snow",
        611: "sleet",
        612: "light shower sleet",
        613: "shower sleet",
        615: "light rain and snow",
        616: "rain and snow",
        620: "light shower snow",
        621: "shower snow",
        622: "heavy shower snow",
        701: "mist",
        711: "smoke",
        721: "haze",
        731: "sand/dust whirls",
        741: "fog",
        751: "sand",
        761: "dust",
        762: "volcanic ash",
        771: "squalls",
        781: "tornado",
        800: "clear sky",
        801: "few clouds: 11-25%",
        802: "scattered clouds: 25-50%",
        803: "broken clouds: 51-84%",
        804: "overcast clouds: 85-100%",
    };
    const fetchSuggestions = async (input) => {
        if (!input) return setSuggestions([]);

        try {
            const res = await fetch(`${geoapi.base}/cities?namePrefix=${input}&limit=5&sort=-population`, {
                headers: geoapi.headers,
            });

            const data = await res.json();

            if (!data || !data.data) {
                setSuggestions([]);
                return;
            }

            const geoSuggestions = data.data.map(city => ({
                name: city.name,
                countryCode: city.countryCode
            }));

            // Validate with OpenWeatherMap
            const validatedSuggestions = [];

            for (const city of geoSuggestions) {
                const cityQuery = `${city.name},${city.countryCode}`;
                const weatherRes = await fetch(`${api.base}weather?q=${cityQuery}&units=metric&APPID=${api.key}`);
                const weatherData = await weatherRes.json();

                if (weatherData.cod === 200) {
                    validatedSuggestions.push(cityQuery);
                }
            }

            setSuggestions(validatedSuggestions);
        } catch (err) {
            console.error(err);
            setSuggestions([]);
        }
    };

    const onInputChange = (e) =>{
        const input = e.target.value;
        setQuery(input);
        fetchSuggestions(input);
    };
    const onSuggestionClick =(city) =>{
        setQuery(city);
        setSuggestions([]);
        setIsFocused(false);
        searching(city);
    };

    const search = evt => {
        if (evt.key === "Enter") {
            searching(query);
        }
    }
const searching = query => {
    fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`)
        .then(res => res.json())
        .then(result => {
            setWeather(result);
            setQuery('');
            setIsFocused(false);
            console.log(result)
        })
        .catch(err => console.error(err))

}
    function dateBuilder(d) {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const days = [
            "Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"
        ];

        const day = days[d.getDay()];
        const date = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();

        return `${day}, ${date} ${month} ${year}`;
    }

    return (
        <div className="App">
            <main>
                {isFocused && <div className="overlay active" onClick={() => setIsFocused(false)}></div>}
                <div className={`search-box ${isFocused ? 'expanded' : ''}`}>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Type city..."
                        onChange={onInputChange}
                        value={query}
                        onKeyPress={search}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    {suggestions.length > 0 &&(
                        <ul className ="suggestions">
                            {suggestions.map((city,idx)=> (
                                <li key={idx} onClick ={() => onSuggestionClick(city)}>
                                    {city}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {(typeof weather.main != "undefined") ? (
                    <div>
                        <div className="location-box">
                            <div className="location">{weather.name}, {weather.sys.country}</div>
                            <div className="date">{dateBuilder(new Date())}</div>
                        </div>
                        <div className="center-container">
                            <div className="weather-box">
                                <div className="temp">
                                    {Math.round(weather.main.temp)}°C
                                    <img
                                        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                                        className="weather-icon"
                                    />
                                </div>
                                <div className="weather">
                                    {weather.weather[0].main}
                                    <div className="description">
                                    {weatherCodeMap[weather.weather[0].id]}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : ('')}
            </main>
        </div>
    );
}



export default App;
