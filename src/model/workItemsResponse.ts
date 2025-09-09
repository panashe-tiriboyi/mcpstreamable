interface BasicWorkItem {
  id: number;
  url: string;
}

interface WorkItemsResponse {
  queryType: 'flat';
  queryResultType: 'workItem';
  asOf: string;
  workItems: BasicWorkItem[];
}

export type { BasicWorkItem, WorkItemsResponse };