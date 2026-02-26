if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "C:/Users/shubh/.gradle/caches/9.0.0/transforms/815c9ea2245e0ac99204779da7660641/transformed/hermes-android-250829098.0.7-debug/prefab/modules/hermesvm/libs/android.x86/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/shubh/.gradle/caches/9.0.0/transforms/815c9ea2245e0ac99204779da7660641/transformed/hermes-android-250829098.0.7-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

