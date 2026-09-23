import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useApp } from '../context/AppContext';
import { updateTask } from '../db/taskService';
import { KANBAN_COLUMNS, STATUS_COLORS } from '../utils/constants';
import { toast } from 'sonner';
import { TaskCard } from '../components/common/TaskCard';
import { FilterBar } from '../components/common/FilterBar';

export default function KanbanBoard() {
  const { filteredTasks, users, projects, currentUserId, setSelectedTaskId } = useApp();

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    if (newStatus !== source.droppableId) {
      try {
        await updateTask(draggableId, { status: newStatus }, currentUserId);
        toast.success(`Task moved to ${newStatus}`);
      } catch (err) {
        toast.error('Failed to update task status');
        console.error(err);
      }
    }
  };

  const tasksByStatus = KANBAN_COLUMNS.reduce((acc, status) => {
    acc[status] = filteredTasks.filter(task => task.status === status) || [];
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <FilterBar />
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-h-full items-start">
            {KANBAN_COLUMNS.map((status) => {
              const columnTasks = tasksByStatus[status];
              const headerBg = STATUS_COLORS[status]?.headerBg || 'bg-gray-100';
              const dotColor = STATUS_COLORS[status]?.dot || 'bg-gray-500';

              return (
                <div key={status} className="flex flex-col min-w-[280px] flex-1 bg-gray-50 rounded-xl rounded-t-lg border border-gray-200">
                  <div className={`px-4 py-3 border-b border-gray-200 rounded-t-lg flex items-center justify-between ${headerBg}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                      <h3 className="font-semibold text-gray-800">{status}</h3>
                    </div>
                    <span className="text-xs font-medium bg-white px-2 py-1 rounded-full text-gray-600 shadow-sm border border-gray-200">
                      {columnTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 flex flex-col gap-3 min-h-[150px] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-gray-100' : ''
                        }`}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedTaskId(task.id)}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.9 : 1,
                                }}
                              >
                                <TaskCard task={task} users={users} projects={projects} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                            <span className="text-sm text-gray-400">No tasks</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
