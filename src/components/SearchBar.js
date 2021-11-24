import React, {useState, useEffect} from 'react';
import SelectSearch from 'react-select-search';
import axios from 'axios'
import Spotify from 'spotify-web-api-js';
import Suggestions from './Suggestions'

const spotifyWebApi = new Spotify();

function SearchBar(){

    const [search, setSearch] = useState({artistName: ""});

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [err, setErr] = useState(false);

    // useEffect(()=>{
    //     setSearch({
    //         artistName: "Search for..."
    //     })
    // })

    const handleInputChange = (e) => {
        let target = e.target;
        let value = target.value;
        let name = target.name;

        let newSearch = { ...search };
        search[name] = value;
        setSearch(newSearch);

        setQuery(search.artistName, ()=>{
            if (query && query.length > 1){
                if (query.length % 2 === 0){
                    getInfo()
                }
            }
        });
      };

    // function getOptions(query){
    //     return new Promise((resolve, reject)=>{
    //         spotifyWebApi.searchArtists(query)
    //         .then(response=>response.json())
    //         .then(({artists})=>{
    //             resolve(artists.artists.name.map(({artistVal, artistName})=>({value: artistVal, name: artistName})))
    //         })
    //         .catch(reject);
    //     });
    // }

    function getInfo() {
        spotifyWebApi.searchArtists(query)
        .then(({data})=>{
            setResults(data.artists.items)
        })
        .catch(()=>{setErr(true)});
    }
    
    return(
        <>
        <form>
            <input 
                placeholder="Search for..."
                // ref={input => search = input}
                name="artistName"
                value={search.artistName}
                onChange={handleInputChange}
            />
            <p>{query}</p>
            <Suggestions results={results} />
        </form>
        </>
    )
}

export default SearchBar;