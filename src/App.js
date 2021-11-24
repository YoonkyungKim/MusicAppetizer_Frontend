import React, {useState, useEffect} from 'react';
import './App.css';
import Spotify from 'spotify-web-api-js';
import RecommendTrack from './components/RecommendTrack';
import RecommendBtn from './components/RecommendBtn';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import markets from './data/markets';
import Login from './components/Login';

const spotifyWebApi = new Spotify();

function App() {
  const params = getHashParams();
  const [loggedIn, setLogggedIn] = useState(
    params.access_token ? true : false
  );

  if (params.access_token){
    spotifyWebApi.setAccessToken(params.access_token);
  };

  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  const [artistRes, setArtistRes] = useState([]);

  const [tracks, setTracks] = useState([]);

  const [audioFeatures, setAudioFeatures] = useState({
    danceabilityRange: [0,0],
    acousticnessRange: [0,0],
    livenessRange: [0,0],
    tempoRange: [0,0]
  })

  const [recommendTracks, setRecommendTracks] = useState([]);

  const [marketSelected, setmarketSelected] = useState(null);

  // if 'tracks' is updated, get audio features of the tracks
  useEffect(()=>{
    if (tracks.length !== 0){
        spotifyWebApi.getAudioFeaturesForTracks(tracks)
        .then(data=>{
          console.log("Artist's track features");
          console.log(data);
          getArtistAudioFeaturesRange(data.audio_features);
        })
    }
    if (marketSelected){
      getRecommendations();
    }
  }, [tracks])

  useEffect(()=>{
    const params = getHashParams();
    if (params.access_token){
        setLogggedIn(true);
    } else {
      setLogggedIn(false);
    }
  }, [])

  const [genres, setGenres] = useState([]);

  function findArtists(artist){
    return new Promise((resolve, reject)=>{
      spotifyWebApi.searchArtists(artist)
      .then((response) => {
        console.log(response.artists.items);
        console.log(response);
        setArtistRes(response.artists.items.slice(0,1));
        // console.log(response.artists.items[0].genres);
        // setGenres(response.artists.items[0].genres);
        spotifyWebApi.searchTracks(`artist:${artist}`)
        .then((response) => {
          setTracks(response.tracks.items.map(e=>e.id));
          resolve()
        })
        .catch(err=>{
          console.log("track: " + err);
          reject()
        })
      })
      .catch(err=>{
        console.log(err);
        reject()
      })
    })
  }

  function getRecommendations(){
    var trackIDs = [];
    var tracks = [];
    var recommend = [];
    spotifyWebApi.searchPlaylists(`top 50 ${marketSelected.label}`, { market: marketSelected.value })
    .then(response => {
      console.log(`${marketSelected.label} top 50`);
      console.log(response);
      var topListExist = false;
      for (let e of response.playlists.items) {

        if (e.owner.display_name === "spotifycharts" || e.owner.display_name === "Spotify"){       
          topListExist = true;
          spotifyWebApi.getPlaylistTracks(e.id)
          .then(data=>{
            
            tracks = data.items;
            // console.log(tracks[0]);
            // get audio features of the tracks
            trackIDs = data.items.map(e=>e.track.id);
            // console.log(trackIDs);
            spotifyWebApi.getAudioFeaturesForTracks(trackIDs)
            .then(features=>{
              console.log("top 50's track features");
              console.log(features);
              
              for(var i = 0; i < features.audio_features.length; i++){
                // if track's each audio feature is within the range of selected artists,
                // add it to the recommendation list (check if it's already added as well)
                if ( (features.audio_features[i].danceability >= audioFeatures.danceabilityRange[0] && 
                    features.audio_features[i].danceability <= audioFeatures.danceabilityRange[1]) &&
                    (features.audio_features[i].acousticness >= audioFeatures.acousticnessRange[0] && 
                    features.audio_features[i].acousticness <= audioFeatures.acousticnessRange[1]) &&
                    (features.audio_features[i].liveness >= audioFeatures.livenessRange[0] && 
                    features.audio_features[i].liveness <= audioFeatures.livenessRange[1]) &&
                    (features.audio_features[i].tempo >= audioFeatures.tempoRange[0] && 
                    features.audio_features[i].tempo <= audioFeatures.tempoRange[1]) && 
                    !recommend.includes(tracks[i])) {
                      recommend.push(tracks[i]);
                }
              }
              
              console.log(recommend);
              console.log(recommend.length);
              recommend.sort((a,b)=>a.track.name.localeCompare(b.track.name));
              recommend.reverse();
              setRecommendTracks(recommend);
            })
          })
        };
      }
      // if there's no top list, set recommendtracks to empty
      if (!topListExist){
        var noTopList = ["no top list"];
        setRecommendTracks(noTopList);
      }
      console.log("artist feature range");
      console.log(audioFeatures);
    
    }).catch(err=>{
      console.log(err);
    })
  }

  function getArtistAudioFeaturesRange(arr){
    var danceabilityList = arr.map(e=>e.danceability);
    var acousticnessList = arr.map(e=>e.acousticness);
    var livenessList = arr.map(e=>e.liveness);
    var tempoList = arr.map(e=>e.tempo);
    console.log("artist features arr");
    console.log(arr);
    setAudioFeatures({
      danceabilityRange: [Math.min.apply(null, danceabilityList), Math.max.apply(null, danceabilityList)],
      acousticnessRange: [Math.min.apply(null, acousticnessList), Math.max.apply(null, acousticnessList)],
      livenessRange: [Math.min.apply(null, livenessList), Math.max.apply(null, livenessList)],
      tempoRange: [Math.min.apply(null, tempoList), Math.max.apply(null, tempoList)]
    });
  } 

  const [input, setInput] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);

  const handleInputChange = input => {
    setInput(input);
  };

  const handleChange = value => {
    // console.log(value);
    setSelectedValue(value);
    if (value){
      findArtists(value[0].name)
    }
  }
  const fetch = window.fetch.bind(window);
   // load options using API call
   const loadOptions = (inputValue) => {    
    return fetch(`https://api.spotify.com/v1/search/?q=${inputValue}&type=artist`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + params.access_token,
      'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(res=>res.json())
      .then(({artists})=>{
        return (artists.items.map(({id, name})=>({id: id, name: name})))
    }).catch(err=>console.log(err))
  }

    return (
    
      <div className="App">
        <Login />
  
        {/* <pre>Input value: "{input}" </pre> */}
        <AsyncSelect 
          isMulti
          cacheOptions 
          defaultOptions 
          value={selectedValue} 
          getOptionLabel={e=>e.name}
          getOptionValue={e=>e.id}
          loadOptions={loadOptions}
          onInputChange={handleInputChange}
          onChange={handleChange} 
          className="basic-multi-select"
        />
  
        <Select 
          defaultValue={marketSelected}
          onChange={setmarketSelected}
          options={markets}
        />  
        <div>
          {/* modify: artist is one */}
          {artistRes !== undefined ? 
            (artistRes.map(e => <div>
                                {e.name} {e.images[0] ? <img src={e.images[0].url} alt={e.name} style={{width: 100}}></img> : ""}
                          </div>)) 
          : "no artist found"}
          
        </div>
        <RecommendBtn recommend={getRecommendations} />
        {recommendTracks.length !== 0 && recommendTracks[0] === "no top list" ? <p>No Top List For This Market</p> :
        (recommendTracks.length !== 0) &&  
        recommendTracks.map(track => (
              <RecommendTrack
                key={track.track.id}
                artists={track.track.artists[0].name}
                img={track.track.album.images[0]}
                title={track.track.name}
                previewUrl={track.track.preview_url}
              />
            ))}
      </div>
    );      
}

export default App;
