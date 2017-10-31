
import { ObjectStore } from "./ObjectStore";

class InMemoryObjectStore implements ObjectStore {

    private cache = {};

    private counter = 0;

    public put(what: any): string {
        this.cache["" + this.counter] = what;
        return "" + this.counter++;
    }

    public get(key: string): any {
        return this.cache[key];
    }
}


const zero = '{"style":[],"dependencies":[],"name":"demo66","type":"maven-project","description":"Demo project for Spring Boot","groupId":"com.example","artifactId":"demo66","version":"0.0.1-SNAPSHOT","bootVersion":"1.5.8.RELEASE","packaging":"jar","applicationName":null,"language":"java","packageName":"com.example.demo66","javaVersion":"1.8","baseDir":"demo","parameters":{"host":"localhost:8080","connection":"keep-alive","upgrade-insecure-requests":"1","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36","accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8","referer":"http://localhost:8080/","accept-encoding":"gzip, deflate, br","accept-language":"en-US,en;q=0.8,de;q=0.6","cookie":"SESSION=a523e848-c3f4-45ae-9c7d-4a08b284f053; JSESSIONID=DEE961EED4170F0BD732AD8C3F44DF01; connect.sid=s%3AaL1fpNoEOWQ3o1NJskvP39Sn46TgU5iQ.udsd9%2BJhWVCURMgAAIk2qO7LbB3ZFuZbgbxNKo3feq0"},"resolvedDependencies":null,"boms":{},"repositories":{},"buildProperties":{"maven":{},"gradle":{},"versions":{}},"facets":[],"build":null}';

export const InMemoryStore: ObjectStore = new InMemoryObjectStore();
InMemoryStore.put(JSON.parse(zero));