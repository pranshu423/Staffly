import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export const SortableWidget = ({ id, children, className }: Props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
            {children}
        </div>
    );
};
