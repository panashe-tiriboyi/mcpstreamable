// Azure DevOps Work Item TypeScript Model

export interface UserIdentity {
  displayName: string;
  url: string;
  _links: {
    avatar: {
      href: string;
    };
  };
  id: string;
  uniqueName: string;
  imageUrl: string;
  descriptor: string;
}

export interface WorkItemLinks {
  self: {
    href: string;
  };
  workItemUpdates: {
    href: string;
  };
  workItemRevisions: {
    href: string;
  };
  workItemComments: {
    href: string;
  };
  html: {
    href: string;
  };
  workItemType: {
    href: string;
  };
  fields: {
    href: string;
  };
}

export interface WorkItemFields {
  'System.AreaPath': string;
  'System.TeamProject': string;
  'System.IterationPath': string;
  'System.WorkItemType': string;
  'System.State': string;
  'System.Reason': string;
  'System.AssignedTo': UserIdentity;
  'System.CreatedDate': string; // ISO 8601 date string
  'System.CreatedBy': UserIdentity;
  'System.ChangedDate': string; // ISO 8601 date string
  'System.ChangedBy': UserIdentity;
  'System.CommentCount': number;
  'System.Title': string;
  'System.BoardColumn': string;
  'System.BoardColumnDone': boolean;
  'System.Description': string;
  'Microsoft.VSTS.Common.StateChangeDate': string; // ISO 8601 date string
  'Microsoft.VSTS.Common.Priority': number;
  'Microsoft.VSTS.Common.ValueArea': string;
  'Microsoft.VSTS.Common.AcceptanceCriteria': string;
  'Microsoft.VSTS.Scheduling.Effort': number;
  'Microsoft.VSTS.Common.BacklogPriority': number;
  'Custom.Prioritylabel': string;
  'Custom.Gemelddoor': string;
  'WEF_B3FED8AD69D747B6AC8B9F6676FE00D5_Kanban.Column': string;
  'WEF_B3FED8AD69D747B6AC8B9F6676FE00D5_Kanban.Column.Done': boolean;
  'WEF_E3D5FEEF0D5C4CD29F6F67FAC6285285_Kanban.Column': string;
  'WEF_E3D5FEEF0D5C4CD29F6F67FAC6285285_Kanban.Column.Done': boolean;
  'WEF_0385387BCAE24F04812DCCA8DDDCACCF_Kanban.Column': string;
  'WEF_0385387BCAE24F04812DCCA8DDDCACCF_Kanban.Column.Done': boolean;
  'WEF_79A5E30B13314406B1F0E7D6F6C55286_Kanban.Column': string;
  'WEF_79A5E30B13314406B1F0E7D6F6C55286_Kanban.Column.Done': boolean;
  'WEF_200960F548D74851B0D1C2812ACEE989_Kanban.Column': string;
  'WEF_200960F548D74851B0D1C2812ACEE989_Kanban.Column.Done': boolean;
  'Custom.2de39240-faed-4fe3-b801-ef09f9fd7649': boolean;
}

export interface MultilineFieldsFormat {
  'System.Description': 'html' | 'plainText';
  'Microsoft.VSTS.Common.AcceptanceCriteria': 'html' | 'plainText';
}

export interface AzureDevOpsWorkItem {
  id: number;
  rev: number;
  fields: WorkItemFields;
  multilineFieldsFormat: MultilineFieldsFormat;
  _links: WorkItemLinks;
  url: string;
}

// Type guards for safer type checking
export function isUserIdentity(obj: any): obj is UserIdentity {
  return obj &&
    typeof obj.displayName === 'string' &&
    typeof obj.url === 'string' &&
    typeof obj.id === 'string' &&
    typeof obj.uniqueName === 'string' &&
    typeof obj.imageUrl === 'string' &&
    typeof obj.descriptor === 'string' &&
    obj._links &&
    obj._links.avatar &&
    typeof obj._links.avatar.href === 'string';
}

export function isWorkItem(obj: any): obj is AzureDevOpsWorkItem {
  return obj &&
    typeof obj.id === 'number' &&
    typeof obj.rev === 'number' &&
    typeof obj.url === 'string' &&
    obj.fields &&
    obj._links &&
    obj.multilineFieldsFormat;
}

// Utility types for common work item states and types
export type WorkItemState = 'New' | 'Active' | 'Resolved' | 'Closed' | 'Refine' | 'Approved' | 'Committed' | 'Done';
export type WorkItemType = 'Product Backlog Item' | 'Bug' | 'Task' | 'Feature' | 'Epic' | 'User Story';
export type Priority = 1 | 2 | 3 | 4;
export type ValueArea = 'Architectural' | 'Business';

// Helper interface for creating new work items (with optional fields)
export interface CreateWorkItemRequest {
  fields: Partial<WorkItemFields> & {
    'System.Title': string;
    'System.WorkItemType': WorkItemType;
  };
}

