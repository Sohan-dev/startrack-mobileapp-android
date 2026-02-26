if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "C:/Users/shubh/.gradle/caches/9.0.0/transforms/2cc296dfe9ded7511f6833149de59f94/transformed/fbjni-0.7.0/prefab/modules/fbjni/libs/android.x86_64/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/shubh/.gradle/caches/9.0.0/transforms/2cc296dfe9ded7511f6833149de59f94/transformed/fbjni-0.7.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

