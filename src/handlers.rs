use crate::theme::{render_image};

use crate::routes::ImageOption;
use ::entity::{count};
use crate::Storage;
use sea_orm::*;

pub async fn count_handlers(
    identifier: String,
    storage: Storage,
    image_option: ImageOption,
) -> Result<impl warp::Reply, warp::Rejection> {
    let count_instance: Result<Option<count::Model>, DbErr> = count::Entity::find_by_id(identifier.clone()).one(&storage.db).await;

    let number: u32;

    if identifier != "demo" {
        number = match count_instance.unwrap() {
            Some(model) => {
                let new_count = model.count + 1;

                let mut active_model: count::ActiveModel = model.into();
                active_model.count = Set(new_count);
                active_model.update(&storage.db).await.expect("Failed to update count");

                new_count
            }
            None => {
                let new_count = count::ActiveModel {
                    id: Set(identifier.clone()),
                    count: Set(1),
                };

                count::Entity::insert(new_count).exec(&storage.db).await.expect("Failed to insert new counter... something is seriously wrong...");

                1
            }
        };
    } else {
        number = 1234567890;
    }

    let rendered = render_image(&storage.theme, &image_option.theme.unwrap_or("moebooru".to_string()), number, image_option.length.unwrap_or(7), image_option.pixelated.unwrap_or(true));
    Ok(warp::reply::with_header(rendered, "content-type", "image/svg+xml"))
}

pub async fn number_handlers(
    number: u32,
    storage: Storage,
    image_option: ImageOption,
) -> Result<impl warp::Reply, warp::Rejection> {
    let rendered = render_image(&storage.theme, &image_option.theme.unwrap_or("moebooru".to_string()), number, image_option.length.unwrap_or(7), image_option.pixelated.unwrap_or(true));
    Ok(warp::reply::with_header(rendered, "content-type", "image/svg+xml"))
}
