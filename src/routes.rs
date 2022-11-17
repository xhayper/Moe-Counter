use crate::handlers::{number_handlers, count_handlers};
use serde::{Serialize, Deserialize};
use std::convert::Infallible;
use crate::Storage;
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

pub fn with_storage(storage: Storage) -> impl Filter<Extract=(Storage, ), Error=Infallible> + Clone {
    warp::any().map(move || storage.clone())
}

pub fn get_count(storage: &Storage) -> impl Filter<Extract=impl warp::Reply, Error=warp::Rejection> + Clone {
    warp::path!("count" / String).and(warp::get()).and(with_storage(storage.clone())).and(with_image_options()).and_then(count_handlers)
}

pub fn get_number(storage: &Storage) -> impl Filter<Extract=impl warp::Reply, Error=warp::Rejection> + Clone {
    warp::path!("number" / u32).and(warp::get()).and(with_storage(storage.clone())).and(with_image_options()).and_then(number_handlers)
}

pub fn static_route() -> impl Filter<Extract=impl warp::Reply, Error=warp::Rejection> + Clone {
    warp::get().and(warp::fs::dir("assets"))
}