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
    INDEX owner_id GLOBAL ON (owner_id),
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
    INDEX fov GLOBAL ON (fov_tl_x, fov_br_x, fov_tl_y, fov_br_y),
    INDEX last_active GLOBAL ON (last_active),
    INDEX tg_user_id GLOBAL ON (tg_user_id),
    INDEX ws_connection_id GLOBAL ON (ws_connection_id),
    PRIMARY KEY (`id`)
);

UPSERT INTO `Config` ( `name`, `grid_cell_size`, `max_active_players`, `max_inactive_sec`, `player_size`, `transport`, `world_size_x`, `world_size_y` ) VALUES ('default', 120, 60, 180, 110, 'ws', 45, 45);

