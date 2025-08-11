import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import { useState, useEffect } from 'react';
import Skeleton from './Skeletons';
import Card from "./Card";


const Community = () => {
    const [cardsData, setCardsData] = useState([]);

    useEffect(() => {
        // Load Card Data
        fetch("http://localhost:4000/events/community?year=2024").then(response => response.json().then(data => setCardsData(data)))
    }, []);

    return <div className="m-0 p-1">
        <ResponsiveMasonry
            columnsCountBreakPoints={{350: 1, 750: 2, 900: 3}}
            gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}
        >
            <Masonry className='w-auto'>
                {cardsData.length > 0 ? cardsData.map((data, idx) => (<Card key={idx} data={data}/>)) : 
                Array(9).fill(0).map((_, idx) => <Skeleton key={idx}/>)}
            </Masonry>
        </ResponsiveMasonry>
    </div>
};
export default Community;