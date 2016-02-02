﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Environment = System.Collections.Generic.IDictionary<string, object>;

namespace Tachi.Tests
{

    public static class Application
    {
        public delegate Task AppFunc(IDictionary<string, object> environment);
        public delegate AppFunc MidFunc(AppFunc appFunc);
        public delegate MidFunc Create<T>(T configuration);
        public static AppFunc NotFound => env =>
        {
            env["owin.ResponseStatusCode"] = 404;
            return Task.FromResult(0);
        };

        public static Func<IEnumerable<MidFunc>, MidFunc> Compose =>
            pipeline =>
                pipeline.Aggregate((current, next)
                    => appFunc
                        => current(next(appFunc)));
        public static Func<IEnumerable<MidFunc>, AppFunc> Build => pipeline => Compose(pipeline)(NotFound);
        public static Func<AppFunc, Environment, Task> Run => (appFunc, env) => appFunc(env);
    }
}