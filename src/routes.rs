use crate::handlers::{number_handlers, count_handlers};
use sea_orm::DatabaseConnection;
use std::convert::Infallible;
use warp::Filter;

pub fn with_db(db: DatabaseConnection) -> impl Filter<Extract=(DatabaseConnection, ), Error=Infallible> + Clone {
    warp::any().map(move || db.clone())
}

pub fn get_count(db: DatabaseConnection) -> impl Filter<Extract=impl warp::Reply, Error=warp::Rejection> + Clone {
    warp::path!("count" / String).and(warp::get()).and(with_db(db)).and_then(count_handlers)
}

pub fn get_number() -> impl Filter<Extract=impl warp::Reply, Error=warp::Rejection> + Clone {
    warp::path!("number" / u32).and(warp::get()).and_then(number_handlers)
}

pub fn static_route() -> impl Filter<Extract=impl warp::Reply, Error=warp::Rejection> + Clone {
    warp::path::end().and(warp::get()).and(warp::fs::dir("assets"))
}