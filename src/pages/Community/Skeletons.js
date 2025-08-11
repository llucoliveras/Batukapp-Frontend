import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'

const CommunitySkeleton = () => {
    var random_height = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
    return <div style={{ height: random_height, width: '100%' }}>
        <div style={{ height: '100%', width: '100%' }}>
            <Skeleton height={'100%'}/>
        </div>
    </div>
}

export default CommunitySkeleton;
