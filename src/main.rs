extern crate dotenv;

mod handlers;
mod routes;
mod theme;

use crate::routes::{get_count, get_number, static_route};
use sea_orm::{Database, DatabaseConnection};
use serde::{Deserialize, Serialize};
use dotenv::dotenv;
use warp::Filter;
use std::env;

#[derive(Serialize, Deserialize)]
pub struct ErrorResponse {
    pub statusCode: u8,
    pub error: String,
    pub message: String,
}

#[tokio::main]
pub async fn main() {
    dotenv().ok();

    let db: DatabaseConnection = Database::connect(env::var("DATABASE_URL").expect("`DATABASE_URL` is undefined!")).await.unwrap();

    let routes = static_route()
        .or(get_count(db.clone()))
        .or(get_number());

    warp::serve(routes).run(([0, 0, 0, 0], 3000)).await;
}