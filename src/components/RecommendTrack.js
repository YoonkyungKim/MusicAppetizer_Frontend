import React, {useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
// function useAudio(url){
//     const [preview] = useState(new Audio(url));
//     const [playing, setPlaying] = useState(false);

//     const toggle = () => setPlaying(!playing);

//     useEffect(() => {
//             playing ? preview.play() : preview.pause();
//         },
//         [playing]
//     );

//     useEffect(() => {
//         preview.addEventListener('ended', () => setPlaying(false));
//         return () => {
//             preview.removeEventListener('ended', ()=> setPlaying(false));
//         };
//     }, []);
//     return [playing, toggle];
// }

function RecommendTrack(props) {
    
//    const [playing, toggle] = useAudio(props.previewUrl);

    const [preview] = useState(new Audio(props.previewUrl));
    const [playing, setPlaying] = useState(false);

    const toggle = () => setPlaying(!playing);

    useEffect(() => {
            playing ? preview.play() : preview.pause();
        },
        [playing]
    );

    function play(song){
        var currentSong = document.getElementById(song);
        currentSong.play();
    }

    function stop(song){
        var currentSong = document.getElementById(song);
        currentSong.pause();
    }
    // useEffect(() => {
    //     preview.addEventListener('ended', () => setPlaying(false));
    //     return () => {
    //         preview.removeEventListener('ended', ()=> setPlaying(false));
    //     };
    // }, []);
    // onClick={(e)=>{clickHandler(e, "Hello")}}
    return (
        <div>
            <div className="track-container">
            {/* <ReactPlayer url={props.previewUrl} /> */}
            {props.previewUrl && <div onMouseOver={(e)=>{play(e, "song")}} onMouseOut={(e)=>{stop(e, "song")}}></div>}
            <audio id="song" controls="controls" src={props.previewUrl} type="audio/mpeg" style={{display: "none"}}></audio>
            {/* {props.previewUrl && } */}
            <img className="track-img" src={props.img.url} alt={props.title} style={{ width: 100 }}></img>
                <div className="track-text-container">
                    <p className="track-text-artist">{props.artists}</p>
                    <p className="track-text-title">{props.title}</p>
                </div>
            </div>
        </div>
    );
}

export default RecommendTrack;