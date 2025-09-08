const WORKSPACE_ID = 'workspace_id'
const PROJECT_ID = 'project_id'
const CURRENT_URL = 'current_url'

const setWorkspaceID = (value: string) => localStorage.setItem(WORKSPACE_ID, value)
const setProjectID = (value: string) => localStorage.setItem(PROJECT_ID, value)
const setCurrentUrl = (value: string) => localStorage.setItem(CURRENT_URL, value)

const getWorkspaceID = () => localStorage.getItem(WORKSPACE_ID)
const getProjectID = () => localStorage.getItem(PROJECT_ID)
const getCurrentUrl = () => localStorage.getItem(CURRENT_URL)

const removeUrl = () => localStorage.removeItem(CURRENT_URL)

export {
  setWorkspaceID,
  setProjectID,
  setCurrentUrl,
  getWorkspaceID,
  getProjectID,
  getCurrentUrl,
  removeUrl,
}
