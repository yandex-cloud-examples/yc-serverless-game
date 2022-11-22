CREATE TABLE `Config`
(
    `name` Utf8,
    `grid_cell_size` Uint32,
    `max_active_players` Uint8,
    `max_inactive_sec` Int32,
    `player_size` Uint32,
    `transport` Utf8,
    `world_size_x` Uint32,
    `world_size_y` Uint32,
    PRIMARY KEY (`name`)
);

CREATE TABLE `GridCells`
(
    `x` Uint32,
    `y` Uint32,
    `owner_id` Utf8,
    PRIMARY KEY (`x`, `y`)
);

CREATE TABLE `Users`
(
    `id` Utf8,
    `cells_count` Uint32,
    `color` Utf8,
    `fov_br_x` Uint32,
    `fov_br_y` Uint32,
    `fov_tl_x` Uint32,
    `fov_tl_y` Uint32,
    `grid_x` Uint32,
    `grid_y` Uint32,
    `image_type` Uint8,
    `last_active` Timestamp,
    `state` Utf8,
    `tg_avatar` Utf8,
    `tg_user_id` Utf8,
    `tg_username` Utf8,
    `ws_connection_id` Utf8,
    PRIMARY KEY (`id`)
);

