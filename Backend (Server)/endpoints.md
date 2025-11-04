# API Endpoints Documentation

This document provides information about all available API endpoints for the Marine Management Backend.

## Base URL
```
http://localhost:8000
```

## CORS Policy
This API has CORS enabled to allow requests from all origins (`*`). This means you can make requests to these endpoints from any domain.

## Ships Endpoints

### Get All Ships
- **URL**: `/ships`
- **Method**: `GET`
- **Description**: Retrieve a list of all ships
- **Response**: 
  ```json
  [
    {
      "name": "string",
      "speed": "number",
      "rotation_speed": "number",
      "humanalert": "number",
      "attack": "number",
      "robery": "number",
      "struck": "number",
      "resource": "number",
      "ubts": "number",
      "time": "number",
      "climate": "number",
      "id": "integer"
    }
  ]
  ```

### Get Ship by ID
- **URL**: `/ships/{ship_id}`
- **Method**: `GET`
- **Description**: Retrieve a specific ship by its ID
- **Parameters**: 
  - `ship_id` (path parameter): Integer ID of the ship
- **Response**: 
  ```json
  {
    "name": "string",
    "speed": "number",
    "rotation_speed": "number",
    "humanalert": "number",
    "attack": "number",
    "robery": "number",
    "struck": "number",
    "resource": "number",
    "ubts": "number",
    "time": "number",
    "climate": "number",
    "id": "integer"
  }
  ```

## AllShips Endpoints

### Get All AllShips
- **URL**: `/allships`
- **Method**: `GET`
- **Description**: Retrieve a list of all AllShip records with their associated ship information
- **Response**: 
  ```json
  [
    {
      "shipid": "integer",
      "name": "string",
      "type": "integer",
      "longitude": "number",
      "latitude": "number",
      "mission": "boolean",
      "ship_info": {
        "name": "string",
        "speed": "number",
        "rotation_speed": "number",
        "humanalert": "number",
        "attack": "number",
        "robery": "number",
        "struck": "number",
        "resource": "number",
        "ubts": "number",
        "time": "number",
        "climate": "number",
        "id": "integer"
      }
    }
  ]
  ```

### Get AllShip by ID
- **URL**: `/allships/{allship_id}`
- **Method**: `GET`
- **Description**: Retrieve a specific AllShip record by its ID with associated ship information
- **Parameters**: 
  - `allship_id` (path parameter): Integer ID of the AllShip record
- **Response**: 
  ```json
  {
    "shipid": "integer",
    "name": "string",
    "type": "integer",
    "longitude": "number",
    "latitude": "number",
    "mission": "boolean",
    "ship_info": {
      "name": "string",
      "speed": "number",
      "rotation_speed": "number",
      "humanalert": "number",
      "attack": "number",
      "robery": "number",
      "struck": "number",
      "resource": "number",
      "ubts": "number",
      "time": "number",
      "climate": "number",
      "id": "integer"
    }
  }
  ```

### Create AllShip
- **URL**: `/addships`
- **Method**: `POST`
- **Description**: Create a new AllShip record
- **Request Body**: 
  ```json
  {
    "name": "string",
    "type": "integer",
    "longitude": "number",
    "latitude": "number",
    "mission": "boolean"
  }
  ```
- **Response**: 
  ```json
  {
    "shipid": "integer",
    "name": "string",
    "type": "integer",
    "longitude": "number",
    "latitude": "number",
    "mission": "boolean"
  }
  ```

## Location Generation Endpoints

### Generate Random Location
- **URL**: `/generate-location`
- **Method**: `GET`
- **Description**: Generate a random longitude and latitude within the Indian Navy operational area
- **Response**: 
  ```json
  {
    "latitude": "number",
    "longitude": "number",
    "message": "Random location generated within Indian Navy operational area"
  }
  ```

### Generate Multiple Random Locations
- **URL**: `/generate-locations`
- **Method**: `GET`
- **Description**: Generate multiple random longitude and latitude coordinates within the Indian Navy operational area
- **Query Parameters**: 
  - `count` (optional): Number of coordinates to generate (default: 5, max: 100)
- **Response**: 
  ```json
  {
    "locations": [
      {
        "latitude": "number",
        "longitude": "number"
      }
    ],
    "count": "integer",
    "message": "Generated X random locations within Indian Navy operational area"
  }
  ```