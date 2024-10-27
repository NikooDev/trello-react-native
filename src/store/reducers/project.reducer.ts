import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProjectInterface, ProjectStateInterface, ProjectStateTmpInterface } from '@Type/project';
import { StateStatusEnum } from '@Type/store';
import { addProject, getProject, getProjects, removeProject, setProject } from '@Action/project.action';

export const projectSlice = createSlice({
	name: 'projectReducer',
	initialState: {
		projects: [],
		project: null,
		tmp: {
			members: [],
			coverID: 0,
			coverURI: {
				landscape: '',
				portrait: ''
			},
			sortPriority: null
		},
		sortPriority: null,
		error: null,
		loading: true,
		status: StateStatusEnum.LOADING
	} as ProjectStateInterface, reducers: {
		setTmp: (state, action: PayloadAction<Partial<ProjectStateTmpInterface>>) => {
			state.tmp = {
				...state.tmp,
				...action.payload
			};
		},
		setSortPriority: (state, action) => {
			state.sortPriority = action.payload;
		},
		resetProjects: (state) => {
			state.loading = true;
			state.projects = [];
		},
		resetProject: (state) => {
			state.loading = true;
			state.project = null;
		},
		setLocalProject: (state, action: PayloadAction<ProjectInterface>) => {
			state.project = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder.addCase(addProject.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(addProject.fulfilled, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.SUCCESS;
			state.projects.push(action.payload);

			state.projects.sort((a, b) => {
				const dateA = a.created;
				const dateB = b.created;

				if (!dateA.isValid || !dateB.isValid) {
					if (!dateA.isValid) {
						return 1;
					}
					if (!dateB.isValid) {
						return -1;
					}
				}

				return dateB.toMillis() - dateA.toMillis();
			});
		}).addCase(addProject.rejected, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.ERROR;
			state.error = action.payload as string;
		}).addCase(getProjects.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(getProjects.fulfilled, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.SUCCESS;
			state.projects = action.payload;
		}).addCase(getProjects.rejected, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.ERROR;
			state.error = action.payload as string;
		}).addCase(getProject.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(getProject.fulfilled, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.SUCCESS;
			state.project = action.payload;
		}).addCase(getProject.rejected, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.ERROR;
			state.error = action.payload as string;
		}).addCase(setProject.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(setProject.fulfilled, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.SUCCESS;

			state.projects = state.projects.map((project) => project.uid === action.meta.arg.uid ? {...project, ...action.payload} : project);

			if (action.payload && state.project) {
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
					uid, adminUID, membersUID, author, priority, title, cover, members, nbTasks, nbTasksEnd, created
				};
			}
		}).addCase(setProject.rejected, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.ERROR;
			state.error = action.payload as string;
		}).addCase(removeProject.pending, (state) => {
			state.loading = true;
			state.status = StateStatusEnum.LOADING;
			state.error = null;
		}).addCase(removeProject.fulfilled, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.SUCCESS;

			state.projects = state.projects.filter((project) => project.uid !== action.payload);

			state.project = null;
		}).addCase(removeProject.rejected, (state, action) => {
			state.loading = false;
			state.status = StateStatusEnum.ERROR;
			state.error = action.payload as string;
		});
	}
});

export const { setTmp, setSortPriority, resetProjects, resetProject, setLocalProject } = projectSlice.actions;
export default projectSlice.reducer;
