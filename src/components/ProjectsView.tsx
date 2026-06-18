import React from 'react';
import { Project, Task, Category } from '../types';
import { FolderPlus, Rocket, Trash2, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  categories: Category[];
  onProjectClick: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onNewProject: () => void;
  onNewCategory: () => void;
}

export function ProjectsView({ projects, tasks, categories, onProjectClick, onDeleteProject, onNewProject, onNewCategory }: ProjectsViewProps) {
  if (projects.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-neutral-900/50 flex items-center justify-center mb-4 border border-neutral-800/50">
           <Rocket className="w-6 h-6 text-neutral-600" />
        </div>
        <h3 className="text-white font-medium mb-1">No active projects</h3>
        <p className="text-neutral-500 text-sm mb-6">Group your tasks into larger goals.</p>
        <div className="flex items-center gap-3">
          <button 
            onClick={onNewCategory}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors border border-neutral-800"
          >
            New Category
          </button>
          <button 
            onClick={onNewProject}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 lg:pt-10 custom-scrollbar pb-[calc(8rem+env(safe-area-inset-bottom))]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white">Projects</h2>
          <p className="text-neutral-500 text-sm">{projects.length} active projects</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onNewCategory}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors border border-neutral-800"
          >
            New Category
          </button>
          <button 
            onClick={onNewProject}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>
      
      {categories.map(category => {
        const categoryProjects = projects.filter(p => p.categoryId === category.id);
        if (categoryProjects.length === 0) return null;

        return (
          <div key={category.id} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></div>
              <h3 className="text-lg font-serif text-white">{category.name}</h3>
              <span className="text-xs text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded-full">{categoryProjects.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {categoryProjects.map(project => {
                const pTasks = tasks.filter(t => t.projectId === project.id);
                const completed = pTasks.filter(t => t.completed).length;
                const total = pTasks.length;
                const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

                return (
                  <div 
                    key={project.id}
                    onClick={() => onProjectClick(project.id)}
                    className="bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 rounded-2xl p-5 cursor-pointer transition-all group relative overflow-hidden flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800/50 flex items-center justify-center border border-neutral-700/50">
                          <Rocket className="w-5 h-5 text-neutral-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium truncate max-w-[200px]">{project.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            {project.deadline ? (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {!isNaN(new Date(project.deadline).getTime()) 
                                  ? format(new Date(project.deadline), 'MMM d, yyyy')
                                  : 'Invalid deadline'}
                              </span>
                            ) : (
                              <span>No deadline</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-neutral-500 hover:text-rose-500 bg-neutral-900/80 rounded-lg transition-all"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {project.description && (
                      <p className="text-sm text-neutral-400 line-clamp-2 mb-6 flex-1 drop-shadow-sm z-10">
                        {project.description}
                      </p>
                    )}

                    <div className="mt-auto z-10">
                      <div className="flex justify-between items-center text-xs text-neutral-400 mb-2">
                        <span>{completed} of {total} tasks</span>
                        <span className="font-medium text-white">{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-1000 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Uncategorized Projects */}
      {(() => {
        const uncategorizedProjects = projects.filter(p => !p.categoryId);
        if (uncategorizedProjects.length === 0) return null;

        return (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-neutral-700"></div>
              <h3 className="text-lg font-serif text-white">Uncategorized</h3>
              <span className="text-xs text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded-full">{uncategorizedProjects.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {uncategorizedProjects.map(project => {
                const pTasks = tasks.filter(t => t.projectId === project.id);
                const completed = pTasks.filter(t => t.completed).length;
                const total = pTasks.length;
                const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

                return (
                  <div 
                    key={project.id}
                    onClick={() => onProjectClick(project.id)}
                    className="bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 rounded-2xl p-5 cursor-pointer transition-all group relative overflow-hidden flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800/50 flex items-center justify-center border border-neutral-700/50">
                          <Rocket className="w-5 h-5 text-neutral-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium truncate max-w-[200px]">{project.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            {project.deadline ? (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {!isNaN(new Date(project.deadline).getTime()) 
                                  ? format(new Date(project.deadline), 'MMM d, yyyy')
                                  : 'Invalid deadline'}
                              </span>
                            ) : (
                              <span>No deadline</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-neutral-500 hover:text-rose-500 bg-neutral-900/80 rounded-lg transition-all"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {project.description && (
                      <p className="text-sm text-neutral-400 line-clamp-2 mb-6 flex-1 drop-shadow-sm z-10">
                        {project.description}
                      </p>
                    )}

                    <div className="mt-auto z-10">
                      <div className="flex justify-between items-center text-xs text-neutral-400 mb-2">
                        <span>{completed} of {total} tasks</span>
                        <span className="font-medium text-white">{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-1000 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
