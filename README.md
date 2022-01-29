<h1>Microservice app</h1>
System based on microservice architecture using containerization technologies, non-relational database, message broker and web services.</br></br>

**System Components:**
- API Service
- Kafka
- Data Service
- MongoDB

Each component runs in a Docker container within a Docker network.</br>
Docker compose and Dockerfiles are used to configure images and containers.

**Description of the functionality of the components:**

_**API Service**_</br>
Provides an HTTP API for access from outside the Docker network. The HTTP API contains the following endpoints:
- Adding a new piece of data. A chunk of data is sent to Kafka.
- Search by added chunks of data. The search is performed by calling the HTTP API Search/Report Service endpoint.
- Get a response based on the added data. Retrieving responses is done by calling the HTTP API Search/Report Service endpoint.

_**Data service**_</br>
Receives data chunks from Kafka to write, writes them to MongoDB.
Provides an HTTP API with the following endpoints:
- Search by added chunks of data. The search is done by fetching from MongoDB.
- Get answers based on the data you add. Produced by fetching from MongoDB using aggregations.
