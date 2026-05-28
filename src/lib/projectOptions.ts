interface ProjectLike {
  id?: unknown
  status?: unknown
}

export function buildProjectOptions(projects: ProjectLike[] | null | undefined): string[] {
  return Array.from(
    new Set(
      (projects ?? [])
        .map(project => (typeof project.id === 'string' ? project.id.trim() : ''))
        .filter(Boolean),
    ),
  ).sort()
}

export function buildProjectStatuses(projects: ProjectLike[] | null | undefined): Array<{ id: string; status: string }> {
  return buildProjectOptions(projects).map(id => {
    const project = (projects ?? []).find(item => item.id === id)
    return { id, status: typeof project?.status === 'string' ? project.status : '' }
  })
}
