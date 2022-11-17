use std::collections::HashMap;
use std::fs;

pub struct ThemeImageData {
    // URI encoded data
    pub data: String,
    pub width: u32,
    pub height: u32,
}

pub type Theme = HashMap<String, HashMap<String, ThemeImageData>>;

pub fn get_theme() -> Theme {
    let mut theme: Theme = HashMap::new();

    let theme_list = fs::read_dir("assets/theme/").unwrap();

    for path in theme_list {
        let path = path.unwrap();
        let theme_file_name = path.file_name();
        let theme_name = theme_file_name.to_str().unwrap();

        theme.insert(theme_name.to_string(), HashMap::new());

        let number_list = fs::read_dir(path.path()).unwrap();
        for number in number_list {
            let (width, height) = match imagesize::size(number.as_ref().expect("FUCK").path()) {
                Ok(val) => (val.width, val.height),
                Err(err) => panic!("Error getting dimensions: {:?}", err)
            };

            let num_path = number.unwrap().path();
            let mut num_path_no_extension = num_path.clone();
            num_path_no_extension.set_extension("");

            let data = fs::read(num_path).unwrap();
            let encoded_data = base64::encode(&data);
            let kind = infer::get(&data).expect("file type is known");

            let image_data = ThemeImageData {
                data: format!("data:{};charset=utf-8;base64,{}", kind.mime_type(), encoded_data),
                width: width as u32,
                height: height as u32,
            };

            theme.get_mut(theme_name).unwrap().insert(num_path_no_extension.file_name().unwrap().to_str().unwrap().to_string(), image_data);
        }
    }

    return theme;
}

pub fn render_image(theme: &Theme, theme_name: &str, number: u32, length: u8, pixelated: bool) -> String {
    let num = format!("{:0>width$}", number, width = (length as usize));
    let num_list = num.split("");

    let mut x = 0;
    let mut y = 0;

    let mut parts: Vec<String> = Vec::new();

    for char in num_list {
        if char == "" {
            continue;
        }
        let image = theme.get(theme_name).unwrap().get(char).unwrap();
        parts.push(format!("<image x=\"{}\" y=\"0\" width=\"{}\" height=\"{}\" href=\"{}\" />", x, image.width, image.height, image.data));
        x += image.width;
        if image.height > y {
            y = image.height;
        }
    }

    return format!("<?xml version=\"1.0\" encoding=\"UTF-8\"?><svg width=\"{}\" height=\"{}\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" {}><title>{}</title><g>{}</g></svg>", x, y, if pixelated { "shape-rendering=\"pixelated\"" } else { "" }, number, parts.join(""));
}