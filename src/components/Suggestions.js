import React from 'react';

function Suggestions(props){
    const options = props.results.map(r=>(
        <li key={r.id}>
            {r.name}
        </li>
    ))
    return <ul>{options}</ul>
}

export default Suggestions;