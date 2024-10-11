import { createSlice } from '@reduxjs/toolkit';
import { addProject, getProject, getProjects, removeProject, setProject } from '@Action/project.action';
import { ProjectStateInterface } from '@Type/project';
import { Photo } from 'pexels';

/**
 * @description Project reducer -> Manage projects state
 */
export const projectSlice = createSlice({
	name: 'projectReducer',
	initialState: {
		projects: [],
		project: null,
		loading: false,
		error: null,
		tmpMembers: [],
		tmpCoverID: null,
		tmpCoverURI: {} as Photo['src'],
		sortPriority: undefined
	} as ProjectStateInterface,
	reducers: {
		setTmpMembers: (state, action) => {
			state.tmpMembers = action.payload.reverse();
		},
		setTmpCoverID: (state, action) => {
			state.tmpCoverID = action.payload;
		},
		setTmpCoverURI: (state, action) => {
			state.tmpCoverURI = action.payload;
		},
		setSortPriority: (state, action) => {
			state.sortPriority = action.payload;
		},
		resetProjects: (state) => {
			state.projects = [];
		}
	},
	extraReducers: (builder) => {
		builder
			/**
			 * Add a project to the state in order of creation date
			 */
		.addCase(addProject.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(addProject.fulfilled, (state, action) => {
			state.loading = false;
			state.projects.push(action.payload);

			state.projects.sort((a, b) => {
				const dateA = new Date(a.created).getTime();
				const dateB = new Date(b.created).getTime();

				if (isNaN(dateA) || isNaN(dateB)) {
					if (isNaN(dateA)) {
						return 1;
					}
					if (isNaN(dateB)) {
						return -1;
					}
				}

				return dateB - dateA;
			});
		})
		.addCase(addProject.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		})

			/**
			 * Get all projects
			 */
		.addCase(getProjects.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(getProjects.fulfilled, (state, action) => {
			state.loading = false;
			state.projects = action.payload;
		})
		.addCase(getProjects.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		})

			/**
			 * Get project by uid
			 */
		.addCase(getProject.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(getProject.fulfilled, (state, action) => {
			state.loading = false;
			state.project = action.payload;
		})
		.addCase(getProject.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		})

			/**
			 * Set project by uid
			 */
		.addCase(setProject.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(setProject.fulfilled, (state, action) => {
			state.loading = false;

			state.projects = state.projects.map((project) =>
				project.uid === action.meta.arg.uid ? { ...project, ...action.payload } : project
			);

			if (state.project && action.payload) {
				const {
					uid = state.project.uid,
					adminUID = state.project.adminUID,
					membersUID = state.project.membersUID,
					author = state.project.author,
					priority = state.project.priority,
					title = state.project.title,
					cover = state.project.cover,
					members = state.project.members,
					nbTasks = state.project.nbTasks,
					nbTasksEnd = state.project.nbTasksEnd,
					created = state.project.created
				} = action.payload;

				state.project = {
					uid,
					adminUID,
					membersUID,
					author,
					priority,
					title,
					cover,
					members,
					nbTasks,
					nbTasksEnd,
					created
				};
			}
		})
		.addCase(setProject.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		})

			/**
			 * Remove project by uid
			 */
		.addCase(removeProject.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(removeProject.fulfilled, (state, action) => {
			state.loading = false;

			state.projects = state.projects.filter(
				(project) => project.uid !== action.payload
			);

			state.project = null;
		})
		.addCase(removeProject.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});
	}
});

export const {
	setTmpMembers, setTmpCoverID, setTmpCoverURI, setSortPriority, resetProjects
} = projectSlice.actions;

export default projectSlice.reducer;
