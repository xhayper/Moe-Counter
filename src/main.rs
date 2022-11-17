extern crate dotenv;

mod handlers;
mod routes;
mod theme;

use crate::routes::{get_count, get_number, static_route};
use sea_orm::{Database, DatabaseConnection};
use serde::{Deserialize, Serialize};
use crate::theme::Theme;
use dotenv::dotenv;
use warp::Filter;
use std::env;

#[derive(Serialize, Deserialize)]
pub struct ErrorResponse {
    pub statusCode: u8,
    pub error: String,
    pub message: String,
}

#[derive(Clone)]
pub struct Storage {
    pub theme: Theme,
    pub db: DatabaseConnection,
}

#[tokio::main]
pub async fn main() {
    dotenv().ok();

    let storage: Storage = Storage {
        theme: theme::get_theme(),
        db: Database::connect(env::var("DATABASE_URL").expect("`DATABASE_URL` is undefined!")).await.unwrap(),
    };

    let routes =
        static_route()
            .or(get_count(&storage))
            .or(get_number(&storage));

    warp::serve(routes).run(([0, 0, 0, 0], 3000)).await;
}