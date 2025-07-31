import { useState, useRef } from 'react';
import { Plus, Edit3, Save, X, Trash2, CheckSquare } from 'lucide-react';

interface Subtask {
  id: number;
  name: string;
  completed: boolean;
}

interface Task {
  id: number;
  name: string;
  completed: boolean;
  description: string;
  subtasks: Subtask[];
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [addingSubtask, setAddingSubtask] = useState<number | null>(null);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const addTask = () => {
    if (newTaskName.trim()) {
      const newTask: Task = {
        id: Date.now(),
        name: newTaskName.trim(),
        completed: false,
        description: '',
        subtasks: []
      };
      setTasks([...tasks, newTask]);
      setNewTaskName('');
    }
  };

  const toggleComplete = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    if (editingTask === id) {
      setEditingTask(null);
    }
    if (addingSubtask === id) {
      setAddingSubtask(null);
      setNewSubtaskName('');
    }
  };

  const addSubtask = (taskId: number) => {
    if (newSubtaskName.trim()) {
      const newSubtask: Subtask = {
        id: Date.now(),
        name: newSubtaskName.trim(),
        completed: false
      };
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      ));
      setNewSubtaskName('');
      setAddingSubtask(null);
    }
  };

  const toggleSubtaskComplete = (taskId: number, subtaskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, completed: !subtask.completed }
                : subtask
            )
          }
        : task
    ));
  };

  const deleteSubtask = (taskId: number, subtaskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId) }
        : task
    ));
  };

  const startAddingSubtask = (taskId: number) => {
    setAddingSubtask(taskId);
    setNewSubtaskName('');
  };

  const cancelAddingSubtask = () => {
    setAddingSubtask(null);
    setNewSubtaskName('');
  };

  const startEditingDescription = (task: Task) => {
    setEditingTask(task.id);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = task.description;
        editorRef.current.focus();
      }
    }, 0);
  };

  const saveDescription = () => {
    if (editorRef.current && editingTask) {
      const description = editorRef.current.innerHTML;
      setTasks(tasks.map(task =>
        task.id === editingTask ? { ...task, description } : task
      ));
      setEditingTask(null);
      // Clear the editor after saving
      editorRef.current.innerHTML = '';
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const handleSubtaskKeyPress = (e: React.KeyboardEvent, taskId: number) => {
    if (e.key === 'Enter') {
      addSubtask(taskId);
    }
  };

  const formatText = (command: string) => {
    document.execCommand(command, false, undefined);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Task List</h1>
      
      {/* Add new task */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter task name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addTask}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No tasks yet. Add one above to get started!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                
                <div className="flex-1">
                  <h3 className={`text-lg font-medium mb-3 ${
                    task.completed
                      ? 'text-gray-500 line-through'
                      : 'text-gray-800'
                  }`}>
                    {task.name}
                  </h3>
                  
                  {/* Description section */}
                  <div className="border-t pt-3">
                    {editingTask === task.id ? (
                      <div>
                        {/* WYSIWYG toolbar */}
                        <div className="flex gap-2 mb-2 p-2 bg-gray-100 rounded border">
                          <button
                            onClick={() => formatText('bold')}
                            className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-50"
                            type="button"
                          >
                            <strong>B</strong>
                          </button>
                          <button
                            onClick={() => formatText('italic')}
                            className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-50"
                            type="button"
                          >
                            <em>I</em>
                          </button>
                          <button
                            onClick={() => formatText('underline')}
                            className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-50"
                            type="button"
                          >
                            <u>U</u>
                          </button>
                          <button
                            onClick={() => formatText('insertUnorderedList')}
                            className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-50"
                            type="button"
                          >
                            • List
                          </button>
                        </div>
                        
                        <div
                          ref={editingTask === task.id ? editorRef : null}
                          contentEditable
                          className="min-h-24 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          style={{ minHeight: '96px' }}
                          suppressContentEditableWarning={true}
                        />
                        
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={saveDescription}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2 text-sm"
                          >
                            <Save size={16} />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2 text-sm"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Display the description */}
                        {task.description && (
                          <div 
                            className="mb-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700"
                            dangerouslySetInnerHTML={{ __html: task.description }}
                          />
                        )}
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingDescription(task)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2 text-sm"
                          >
                            <Edit3 size={14} />
                            {task.description ? 'Edit Description' : 'Add Description'}
                          </button>
                          
                          <button
                            onClick={() => startAddingSubtask(task.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2 text-sm"
                          >
                            <CheckSquare size={14} />
                            Add Subtask
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Subtasks section */}
                    {(task.subtasks.length > 0 || addingSubtask === task.id) && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Subtasks</h4>
                        
                        {/* Existing subtasks */}
                        {task.subtasks.map(subtask => (
                          <div key={subtask.id} className="flex items-center gap-3 mb-2 p-2 bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() => toggleSubtaskComplete(task.id, subtask.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className={`flex-1 text-sm ${
                              subtask.completed
                                ? 'text-gray-500 line-through'
                                : 'text-gray-700'
                            }`}>
                              {subtask.name}
                            </span>
                            <button
                              onClick={() => deleteSubtask(task.id, subtask.id)}
                              className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                              title="Delete subtask"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        
                        {/* Add new subtask */}
                        {addingSubtask === task.id && (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={newSubtaskName}
                              onChange={(e) => setNewSubtaskName(e.target.value)}
                              onKeyPress={(e) => handleSubtaskKeyPress(e, task.id)}
                              placeholder="Enter subtask name..."
                              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => addSubtask(task.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              onClick={cancelAddingSubtask}
                              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Delete button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                  title="Delete task"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;