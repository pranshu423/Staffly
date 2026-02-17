import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SkeletonProps {
    count?: number;
    height?: number | string;
    width?: number | string;
    className?: string;
    circle?: boolean;
}

export const LoadingSkeleton = ({ count = 1, height, width, className, circle = false }: SkeletonProps) => {
    return (
        <Skeleton
            count={count}
            height={height}
            width={width}
            className={className}
            circle={circle}
            baseColor="#e2e8f0"
            highlightColor="#f8fafc"
        />
    );
};
