use crate::handlers::{number_handlers, count_handlers};
use serde::{Serialize, Deserialize};
use sea_orm::DatabaseConnection;
use std::convert::Infallible;
use warp::Filter;

#[derive(Serialize, Deserialize)]
pub struct ImageOption {
    pub pixelated: Option<bool>,
    pub theme: Option<String>,
    pub length: Option<u8>,
}

pub fn with_image_options() -> impl Filter<Extract=(ImageOption, ), Error=warp::Rejection> + Clone {
    warp::query::<ImageOption>()
        .map(|image_option: ImageOption| image_option)
}

pub fn with_db(db: DatabaseConnection) -> impl Filter<Extract=(DatabaseConnection, ), Error=Infallible> + Clone {
    warp::any().map(move || db.clone())
}

pub fn get_count(db: DatabaseConnection) -> impl Filter<Extract=impl warp::Reply, Error=warp::Rejection> + Clone {
    warp::path!("count" / String).and(warp::get()).and(with_db(db)).and(with_image_options()).and_then(count_handlers)
}

pub fn get_number() -> impl Filter<Extract=impl warp::Reply, Error=warp::Rejection> + Clone {
    warp::path!("number" / u32).and(warp::get()).and(with_image_options()).and_then(number_handlers)
}

pub fn static_route() -> impl Filter<Extract=impl warp::Reply, Error=warp::Rejection> + Clone {
    warp::get().and(warp::fs::dir("assets"))
}