"use client"
import { useState, useEffect } from "react";
import { GripVertical } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ItemEvent = {
  key: string;
  id: string;
  info: string
  desc: string;
  duration: number;
}


export default function Home() {
  const dates = [
    "02 Wed",
    "03 Thu",
    "04 Fri",
    "05 Sat",
    "06 Sun",
  ];

  const [events, setEvents] = useState<ItemEvent[]>([
    {
      key: "flight",
      id: "1",
      info: "🛫 HJZ789",
      desc: "Flight from 🇪🇸 BCN in Barcelona to 🇮🇹 FCO in Italy",
      duration: 3,
    },
    {
      key: "hostel",
      id: "2",
      info: "🏨 Hostel",
      desc: "Check-in at Grand Youth hostel",
      duration: 1,
    },
    {
      key: "breakfast",
      id: "3",
      info: "🍳 breakfast",
      desc: "Breakfast at Grand Youth hostel",
      duration: 1,
    },
    {
      key: "museum",
      id: "4",
      info: "🏛️ museum",
      desc: "Visit the Vatican Museum",
      duration: 3,
    },
    {
      key: "lunch",
      id: "5",
      info: "🍲 lunch",
      desc: "Lunch at The Superrfood restaurant",
      duration: 2,
    },
    {
      key: "siesta",
      id: "6",
      info: "🛋️ siesta",
      desc: "Siesta back at the hostel",
      duration: 1.5,
    },
    {
      key: "walk",
      id: "7",
      info: "🚶‍♂️ walk",
      desc: "Walk around the city center",
      duration: 2.5,
    },
    {
      key: "game",
      id: "8",
      info: "🎮 game",
      desc: "Hostel boards game",
      duration: 3,
    },
  ]);

  return (
    <>
      <nav className="shadow-md/5 py-3 px-6 bg-white">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* @todo: replace wiht a chatgpt gen logo */}
          <h1 className="text-sm text-gray-600 font-medium">DayDeck</h1>
          <img className="h-8 w-8 rounded-full" src="https://avatars.githubusercontent.com/u/10198978?v=4" alt="pfp" />
        </div>
      </nav>
      <main className="font-sans max-w-2xl mx-auto px-6">
        {/* Tablist Dates */}
        <div className="w-fit flex flex-col items-center mx-auto mt-6">
          <h2 className="text-gray-800">May</h2>
          <ol className="space-x-10 mx-auto w-fit mt-4 flex">
            {
              dates.map((date) => (
                date === "04 Fri" ? (
                  <li
                    key={date}
                    className="text-sm text-gray-600 font-medium bg-gray-200 px-2 py-1 rounded-sm cursor-pointer"
                  >
                    {date}
                  </li>

                ) : (
                  <li
                    key={date}
                    className="text-sm text-gray-600 font-medium px-2 py-1 cursor-pointer"
                  >
                    {date}
                  </li>
                )
              ))
            }
          </ol>
        </div>
        <div className="flex mt-8">
          <div className="bg-slate-200">
            <h3 className="h-7 flex items-center justify-center text-sm bg-slate-300 text-gray-800">
              GMT +2
            </h3>
            <ol>
              {[...Array(17)].map((_, i) => (
                <li key={i} className="h-14 flex items-center text-gray-700 px-4 border-b border-b-gray-300">
                  {padWithZero((i + 6) % 24)}:00
                </li>
              ))}
            </ol>
          </div>
          <div className="flex-1 ml-4">
            <h2 className="h-7 w-full bg-slate-300 rounded-sm flex items-center justify-center text-sm">
              Day trip to Rome
            </h2>
            <DragableEvents events={events} setEvents={setEvents} />
          </div >
        </div>
      </main >
    </>
  );
}


// Client-side only draggable events component to avoid hydration issues
function DragableEvents({ events, setEvents }: { 
  events: ItemEvent[];
  setEvents: React.Dispatch<React.SetStateAction<ItemEvent[]>>;
}) {
  const [mounted, setMounted] = useState(false);
  
  // Initialize sensors outside of conditionals to avoid hook rules warnings
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setEvents((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  // Component for non-interactive version before client-side hydration
  const StaticEvents = () => (
    <ol className="flex flex-col relative">
      {events.map((event) => (
        <li
          key={event.id}
          className="py-2"
          style={{ height: 4 * 14 * event.duration }}
        >
          <div className="bg-slate-200 flex items-center justify-between pl-4 rounded-md h-full">
            <span className="flex-1">{event.info}</span>
            <span className="justify-between items-center flex-3 truncate">{event.desc}</span>
            <span className="flex-0.5 flex justify-end mr-2 text-gray-500">
              <GripVertical height={18} />
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
  
  // Component for interactive drag-and-drop
  const DraggableEvents = () => (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={events.map(e => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="flex flex-col relative">
          {events.map((event) => (
            <SortableEventItem key={event.id} event={event} />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
  
  // Conditionally render based on client-side hydration
  return mounted ? <DraggableEvents /> : <StaticEvents />;
}

// Sortable item component
function SortableEventItem({ event }: { event: ItemEvent }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: event.id });
  
  const style = {
    height: 4 * 14 * event.duration,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
    boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.2)' : 'none',
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="py-2"
      {...attributes}
    >
      <div className="bg-slate-200 flex items-center justify-between pl-4 rounded-md h-full">
        <span className="flex-1">
          {event.info}
        </span>
        <span className="justify-between items-center flex-3 truncate">
          {event.desc}
        </span>
        <span 
          className="flex-0.5 flex justify-end mr-2 text-gray-500 cursor-grab active:cursor-grabbing" 
          {...listeners}
        >
          <GripVertical height={18} />
        </span>
      </div>
    </li>
  );
}

function padWithZero(number: number) {
  if (number < 10) {
    return "0" + number;
  } else {
    return number;
  }
}


