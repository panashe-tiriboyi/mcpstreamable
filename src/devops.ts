import axios from "axios";
import { WorkItemsResponse } from "./model/workItemsResponse.js";
import { AzureDevOpsWorkItem } from "./model/azureDevOpsWorkItem.js";
import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 600, // 10 minutes default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
});

// Set cache
cache.set("key", "value", 300); // 5 minutes TTL

// // Get cache
// const value = cache.get<string>('key');

// // Check if key exists
// const hasKey = cache.has('key');

// // Delete key
// cache.del('key');

interface WiqlQuery {
  query: string;
}

// We can remove WiqlResponse interface since we're using WorkItemsResponse from our model

async function queryAzureDevOpsWorkItems(
  organization: string,
  project: string,
  personalAccessToken: string,
  query: string
): Promise<WorkItemsResponse> {
  const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/wiql?api-version=7.1&$top=19998`;

  const requestBody: WiqlQuery = {
    query: query,
  };

  // Create Basic Auth header using Personal Access Token
  // For Azure DevOps, username can be empty string when using PAT
  const authString = Buffer.from(`:${personalAccessToken}`).toString("base64");

  try {
    const response = await axios.post<any>(url, requestBody, {
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Return only the fields we want
    return {
      queryType: response.data.queryType,
      queryResultType: response.data.queryResultType,
      asOf: response.data.asOf,
      workItems: response.data.workItems.map((item: any) => ({
        id: item.id,
        url: item.url,
      })),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error:",
        error.response?.status,
        error.response?.statusText
      );
      console.error("Error details:", error.response?.data);
    } else {
      console.error("Error querying Azure DevOps:", error);
    }
    throw error;
  }
}

// Additional function to get full work item details
async function getWorkItemDetails(
  organization: string,
  workItemIds: number[],
  personalAccessToken: string
): Promise<any[]> {
  const ids = workItemIds.join(",");
  const url = `https://dev.azure.com/${organization}/_apis/wit/workitems?ids=${ids}&api-version=7.1`;

  const authString = Buffer.from(`:${personalAccessToken}`).toString("base64");

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.value;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error:",
        error.response?.status,
        error.response?.statusText
      );
    }
    throw error;
  }
}

async function queryAzureDevOpsWorkItemsById(
  organization: string,
  project: string,
  personalAccessToken: string,
  id: string
): Promise<AzureDevOpsWorkItem> {
  const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/workItems/${id}?api-version=7.1`;

  const authString = Buffer.from(`:${personalAccessToken}`).toString("base64");
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    });

    return response.data; // <-- FIX: return the work item object directly
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error:",
        error.response?.status,
        error.response?.statusText
      );
      console.error("Error details:", error.response?.data);
    } else {
      console.error("Error querying Azure DevOps:", error);
    }
    throw error;
  }
}

export async function queryAzureDevOpsWorkItemsWithDetails(
  organization: string,
  project: string,
  personalAccessToken: string,
  wiql: string
): Promise<AzureDevOpsWorkItem[]> {
  // Get the list of work items
  const workItemsResponse = await queryAzureDevOpsWorkItems(
    organization,
    project,
    personalAccessToken,
    wiql
  );

  // Fetch details for each work item in parallel
  const details = await Promise.all(
    workItemsResponse.workItems.map((item) =>
      queryAzureDevOpsWorkItemsById(
        organization,
        project,
        personalAccessToken,
        String(item.id)
      )
    )
  );

  return details;
}

export {
  queryAzureDevOpsWorkItems,
  queryAzureDevOpsWorkItemsById,
  getWorkItemDetails,
};
