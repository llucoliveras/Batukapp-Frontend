import Card from '../components/Card';
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'


const Community = () => {
    const [cardsData, setCardsData] = useState([]);
    const [cards, setCards] = useState([]);

    useEffect(() => {
        // Load Card Data
        fetch("http://localhost:4000/events/community?year=2024").then(response => response.json().then(data => setCardsData(data)))
    }, []);

    useEffect(() => {
        if (cardsData.length <= 0 || cardsData === undefined || !Array.isArray(cardsData)) {
            setCards([]);
        } else {
            setCards(cardsData.map((data, index) => (
                <Card 
                    key={index}
                    idevent={data.idevent}
                    title={data.name}
                    description={data.description}
                    date={new Intl.DateTimeFormat('es-ES', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                    }).format(new Date(data.start_date.replace(" ", "T")))}
                    time={new Intl.DateTimeFormat('es-ES', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: false
                    }).format(new Date(data.start_date.replace(" ", "T")))}
                    ubication={data.location}
                />
            )));
        }
    }, [cardsData]);

    const skeletons = Array(9).fill(0).map((_, i) => {
        var random_height = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
        return (
        <div key={i} style={{ height: random_height, width: '100%' }}>
            <div style={{ height: '100%', width: '100%' }}>
                <Skeleton height={'100%'}/>
            </div>
        </div>
        )
});

    return <div className="m-0 p-1">
        <ResponsiveMasonry
            columnsCountBreakPoints={{350: 1, 750: 2, 900: 3}}
            gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}
        >
            <Masonry className='w-auto'>
                {cards.length > 0 ? cards : skeletons}
                <Skeleton/>
            </Masonry>
        </ResponsiveMasonry>
    </div>
};
export default Community;