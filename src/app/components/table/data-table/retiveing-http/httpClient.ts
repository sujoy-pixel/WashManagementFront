import { HttpClient } from "@angular/common/http";
import { SortDirection } from "@angular/material/sort";
import { Observable } from "rxjs";

export interface GithubApi {
items: GithubIssue[];
total_count: number;
}

export interface GithubIssue {
created_at: string;
number: string;
state: string;
title: string;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDatabase {
    constructor(private _httpClient: HttpClient) {}

    getRepoIssues(sort: string, order: SortDirection, page: number): Observable<GithubApi> {
        const href = 'https://api.github.com/search/issues';
        const requestUrl = `${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${
        page + 1
        }`;
        return this._httpClient.get<GithubApi>(requestUrl);
    }
}