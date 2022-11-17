use crate::theme::{get_theme, render_image};
use ::entity::{count};
use sea_orm::*;
use warp::http;

pub async fn count_handlers(
    identifier: String,
    db: DatabaseConnection,
) -> Result<impl warp::Reply, warp::Rejection> {
    let count_instance: Result<Option<count::Model>, DbErr> = count::Entity::find_by_id(identifier.clone()).one(&db).await;

    let num: u32;

    if identifier != "demo" {
        num = match count_instance.unwrap() {
            Some(model) => {
                let new_count = model.count + 1;

                let mut active_model: count::ActiveModel = model.into();
                active_model.count = Set(new_count);

                active_model.update(&db).await.expect("Failed to update count");

                new_count
            }
            None => {
                let new_count = count::ActiveModel {
                    id: Set(identifier.clone()),
                    count: Set(1),
                };

                count::Entity::insert(new_count).exec(&db).await.expect("Failed to insert new counter... something is seriously wrong...");

                1
            }
        };
    } else {
        num = 1234567890;
    }

    let theme = get_theme();
    let rendered = render_image(&theme, "rule34", num, 7, true);

    Ok(warp::reply::with_header(rendered, "content-type", "image/svg+xml"))
}

pub async fn number_handlers(
    number: u32,
) -> Result<impl warp::Reply, warp::Rejection> {
    Ok(warp::reply::with_status(
        number.to_string(),
        http::StatusCode::CREATED,
    ))
}
